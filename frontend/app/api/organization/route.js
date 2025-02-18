import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const response = await fetch('http://localhost:5000/api/organization', {
      headers: {
        'Authorization': `Bearer ${request.cookies.get('token')?.value}`,
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { message: 'Failed to fetch organization details' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const response = await fetch('http://localhost:5000/api/organization', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.cookies.get('token')?.value}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json(
      { message: 'Failed to update organization details' },
      { status: 500 }
    );
  }
}
