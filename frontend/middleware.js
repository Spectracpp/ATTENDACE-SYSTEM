import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;

  // Public paths that don't require authentication
  const publicPaths = [
    '/auth/login',
    '/auth/login/user',
    '/auth/login/admin',
    '/auth/admin/login',
    '/auth/register',
    '/auth/register/admin',
    '/auth/register/user',
    '/',
    '/api',
  ];

  // Admin-only paths
  const adminPaths = [
    '/admin',
    '/admin/dashboard',
  ];

  const currentPath = request.nextUrl.pathname;

  // Skip middleware for public paths and API routes
  if (publicPaths.some(path => currentPath.startsWith(path))) {
    return NextResponse.next();
  }

  // If no token, redirect to login
  if (!token) {
    // For admin paths, redirect to admin login
    if (adminPaths.some(path => currentPath.startsWith(path))) {
      return NextResponse.redirect(new URL('/auth/admin/login', request.url));
    }
    // For other protected paths, redirect to user login
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If trying to access admin paths without admin role
  if (adminPaths.some(path => currentPath.startsWith(path)) && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/auth/:path*',
    '/profile/:path*',
  ],
};
