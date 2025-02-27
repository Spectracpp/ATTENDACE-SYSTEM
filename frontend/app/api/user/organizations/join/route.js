import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Add timeout controller to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    try {
      const body = await request.json();
      const { code } = body;
      
      if (!code) {
        return NextResponse.json({
          success: false,
          message: 'Missing required field: code'
        }, { status: 400 });
      }
      
      const response = await fetch('http://localhost:5000/api/user/organizations/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
        signal: controller.signal,
      });

      // Clear the timeout
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to join organization: ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      // Clear the timeout if it's a fetch error
      clearTimeout(timeoutId);
      
      console.error('Error joining organization:', fetchError);
      
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
        message: fetchError.message || 'Failed to join organization. Please try again.'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Unexpected error in join organization API route:', error);
    return NextResponse.json({
      success: false,
      message: 'An unexpected error occurred while joining the organization'
    }, { status: 500 });
  }
}
