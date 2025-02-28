import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Organization ID is required'
      }, { status: 400 });
    }

    // Add timeout controller to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      // Get authentication token from cookies
      const cookieStore = cookies();
      const token = cookieStore.get('token')?.value;
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/organizations/${id}`, {
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
        // If the backend returns an error, try to use fallback data
        throw new Error(`Failed to fetch organization: ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      // Clear the timeout if it's a fetch error
      clearTimeout(timeoutId);
      
      console.error('Error fetching organization:', fetchError);
      
      // Check if it's a network error or timeout
      if (fetchError.name === 'AbortError') {
        console.log('Request timed out, using fallback data');
      } else if (fetchError.message.includes('fetch')) {
        console.log('Network error, using fallback data');
      }
      
      // Return hardcoded organization as fallback based on ID
      const fallbackOrganizations = {
        '1': {
          _id: '1',
          name: 'Manav Rachna International University',
          code: 'MRIU'
        },
        '2': {
          _id: '2',
          name: 'Delhi Public School',
          code: 'DPS'
        },
        '3': {
          _id: '3',
          name: 'Indian Institute of Technology Delhi',
          code: 'IITD'
        },
        '4': {
          _id: '4',
          name: 'All India Institute of Medical Sciences',
          code: 'AIIMS'
        },
        '5': {
          _id: '5',
          name: 'Jamia Millia Islamia',
          code: 'JMI'
        }
      };

      const organization = fallbackOrganizations[id];
      
      if (organization) {
        return NextResponse.json({
          success: true,
          message: 'Using fallback organization data',
          organization
        });
      } else {
        return NextResponse.json({
          success: false,
          message: 'Organization not found',
        }, { status: 404 });
      }
    }
  } catch (error) {
    console.error('Unexpected error in organization API route:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve organization'
    }, { status: 500 });
  }
}
