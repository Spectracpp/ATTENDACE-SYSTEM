import { NextResponse } from 'next/server';

export function middleware(request) {
  console.log('Middleware processing path:', request.nextUrl.pathname);
  
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;

  console.log('Auth state:', { token: !!token, role });

  // Public paths that don't require authentication
  const publicPaths = [
    '/auth/login',
    '/auth/login/user',
    '/auth/login/admin',
    '/auth/admin/login',
    '/auth/register',
    '/auth/register/admin',
    '/auth/register/user',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
    '/',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/check',
  ];

  // Admin-only paths
  const adminPaths = [
    '/admin',
    '/admin/dashboard',
    '/admin/users',
    '/admin/analytics',
    '/admin/organization',
    '/admin/notifications',
    '/admin/settings',
  ];

  const currentPath = request.nextUrl.pathname;

  // Skip middleware for public paths and API routes
  if (publicPaths.some(path => currentPath.startsWith(path))) {
    console.log('Public path, allowing access');
    return NextResponse.next();
  }

  // If no token, redirect to login
  if (!token) {
    console.log('No token found, redirecting to login');
    // For admin paths, redirect to admin login
    if (adminPaths.some(path => currentPath.startsWith(path))) {
      return NextResponse.redirect(new URL('/auth/admin/login', request.url));
    }
    // For other protected paths, redirect to user login
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Check role-based access
  if (adminPaths.some(path => currentPath.startsWith(path)) && role !== 'admin') {
    console.log('Non-admin attempting to access admin path');
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  console.log('Access granted');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.svg).*)',
  ],
};
