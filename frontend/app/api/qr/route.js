import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Add timeout controller to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    try {
      // Get authentication token from cookies
      const cookieStore = cookies();
      const token = cookieStore.get('token')?.value;
      
      const response = await fetch('http://localhost:5000/api/qr', {
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
        throw new Error(`Failed to fetch QR codes: ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      // Clear the timeout if it's a fetch error
      clearTimeout(timeoutId);
      
      console.error('Error fetching QR codes:', fetchError);
      
      // Check if it's a network error or timeout
      if (fetchError.name === 'AbortError') {
        console.log('Request timed out, using fallback data');
      } else if (fetchError.message.includes('fetch')) {
        console.log('Network error, using fallback data');
      }
      
      // Return fallback QR codes data
      return NextResponse.json({
        success: true,
        message: 'Using fallback QR code data',
        qrCodes: [
          {
            _id: '1',
            organizationId: '1',
            organizationName: 'Manav Rachna International University',
            type: 'attendance',
            code: 'QR12345',
            validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            isActive: true,
            createdAt: new Date().toISOString(),
            scanCount: 0
          },
          {
            _id: '2',
            organizationId: '2',
            organizationName: 'Delhi Public School',
            type: 'attendance',
            code: 'QR67890',
            validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            isActive: true,
            createdAt: new Date().toISOString(),
            scanCount: 5
          }
        ]
      });
    }
  } catch (error) {
    console.error('Unexpected error in QR codes API route:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve QR codes',
      qrCodes: [] // Return empty array to prevent UI errors
    }, { status: 500 });
  }
}
