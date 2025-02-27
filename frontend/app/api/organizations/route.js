import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Add timeout controller to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      // Get authentication token from cookies
      const cookieStore = cookies();
      const token = cookieStore.get('token')?.value;
      
      const response = await fetch('http://localhost:5000/api/organizations', {
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
        throw new Error(`Failed to fetch organizations: ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      // Clear the timeout if it's a fetch error
      clearTimeout(timeoutId);
      
      console.error('Error fetching organizations:', fetchError);
      
      // Check if it's a network error or timeout
      if (fetchError.name === 'AbortError') {
        console.log('Request timed out, using fallback data');
      } else if (fetchError.message.includes('fetch')) {
        console.log('Network error, using fallback data');
      }
      
      // Return hardcoded organizations as fallback
      const fallbackOrganizations = [
        {
          _id: '1',
          name: 'Manav Rachna International University',
          code: 'MRIU'
        },
        {
          _id: '2',
          name: 'Delhi Public School',
          code: 'DPS'
        },
        {
          _id: '3',
          name: 'Indian Institute of Technology Delhi',
          code: 'IITD'
        },
        {
          _id: '4',
          name: 'All India Institute of Medical Sciences',
          code: 'AIIMS'
        },
        {
          _id: '5',
          name: 'Jamia Millia Islamia',
          code: 'JMI'
        }
      ];

      return NextResponse.json({
        success: true,
        message: 'Using fallback organization data',
        organizations: fallbackOrganizations
      });
    }
  } catch (error) {
    console.error('Unexpected error in organizations API route:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve organizations',
      organizations: [] // Return empty array to prevent UI errors
    }, { status: 500 });
  }
}
