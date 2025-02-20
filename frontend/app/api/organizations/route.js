import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://localhost:5000/api/organizations', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Disable caching to always get fresh data
    });

    if (!response.ok) {
      throw new Error('Failed to fetch organizations');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    
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
      organizations: fallbackOrganizations
    });
  }
}
