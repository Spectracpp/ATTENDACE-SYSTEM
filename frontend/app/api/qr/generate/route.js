import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    // Add timeout controller to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const body = await request.json();
      const { organizationId, type, validityHours, allowMultipleScans, ...otherData } = body;
      
      if (!organizationId || !type) {
        return NextResponse.json({
          success: false,
          message: 'Missing required fields: organizationId or type'
        }, { status: 400 });
      }
      
      // Get authentication token from cookies
      const cookieStore = cookies();
      const token = cookieStore.get('token')?.value;
      
      const response = await fetch(`http://localhost:5000/api/qr/generate/${organizationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          type: type || 'attendance',
          validityHours: validityHours || 24,
          allowMultipleScans: allowMultipleScans || false,
          ...otherData
        }),
        signal: controller.signal,
      });

      // Clear the timeout
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to generate QR code: ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      // Clear the timeout if it's a fetch error
      clearTimeout(timeoutId);
      
      console.error('Error generating QR code:', fetchError);
      
      // Check if it's a network error or timeout
      if (fetchError.name === 'AbortError') {
        return NextResponse.json({
          success: false,
          message: 'Request timed out. Please try again.'
        }, { status: 408 });
      } else if (fetchError.message.includes('fetch')) {
        return NextResponse.json({
          success: false,
          message: 'Network error. Please check your connection and try again.'
        }, { status: 503 });
      }
      
      return NextResponse.json({
        success: false,
        message: fetchError.message || 'Failed to generate QR code. Please try again.'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Unexpected error in QR generate API route:', error);
    return NextResponse.json({
      success: false,
      message: 'An unexpected error occurred while generating the QR code'
    }, { status: 500 });
  }
}
