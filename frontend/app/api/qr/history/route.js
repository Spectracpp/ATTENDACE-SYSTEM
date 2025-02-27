import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    // Add timeout controller to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      // Get query parameters
      const { searchParams } = new URL(request.url);
      const organizationId = searchParams.get('organizationId');
      const page = searchParams.get('page') || 1;
      const limit = searchParams.get('limit') || 10;
      const sortBy = searchParams.get('sortBy') || 'createdAt';
      const sortOrder = searchParams.get('sortOrder') || 'desc';
      
      if (!organizationId) {
        return NextResponse.json({
          success: false,
          message: 'Missing required parameter: organizationId'
        }, { status: 400 });
      }
      
      // Get authentication token from cookies
      const cookieStore = cookies();
      const token = cookieStore.get('token')?.value;
      
      // Build query string
      const queryParams = new URLSearchParams({
        page,
        limit,
        sortBy,
        sortOrder
      }).toString();
      
      const response = await fetch(`http://localhost:5000/api/qr/history/${organizationId}?${queryParams}`, {
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
        throw new Error(`Failed to fetch QR code history: ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      // Clear the timeout if it's a fetch error
      clearTimeout(timeoutId);
      
      console.error('Error fetching QR code history:', fetchError);
      
      // Check if it's a network error or timeout
      if (fetchError.name === 'AbortError') {
        console.log('Request timed out, using fallback data');
      } else if (fetchError.message.includes('fetch')) {
        console.log('Network error, using fallback data');
      }
      
      // Return fallback QR code history data
      return NextResponse.json({
        success: true,
        message: 'Using fallback QR code history data',
        history: {
          records: [
            {
              _id: '1',
              qrCodeId: '1',
              qrCode: 'QR12345',
              organizationId: '1',
              organizationName: 'Manav Rachna International University',
              userId: 'user1',
              userName: 'John Doe',
              scannedAt: new Date().toISOString(),
              location: { latitude: 28.4595, longitude: 77.0266 }
            },
            {
              _id: '2',
              qrCodeId: '2',
              qrCode: 'QR67890',
              organizationId: '2',
              organizationName: 'Delhi Public School',
              userId: 'user2',
              userName: 'Jane Smith',
              scannedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              location: { latitude: 28.6139, longitude: 77.2090 }
            }
          ],
          pagination: {
            total: 2,
            page: 1,
            limit: 10,
            pages: 1
          }
        }
      });
    }
  } catch (error) {
    console.error('Unexpected error in QR code history API route:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve QR code history',
      history: {
        records: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          pages: 0
        }
      }
    }, { status: 500 });
  }
}
