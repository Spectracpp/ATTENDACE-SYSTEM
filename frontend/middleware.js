import { NextResponse } from 'next/server';

export function middleware(request) {
  // Public paths that don't require authentication
  const publicPaths = [
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

  // Skip middleware for public paths, static files, and API routes
  if (
    publicPaths.some(path => currentPath.startsWith(path)) ||
    currentPath.startsWith('/_next') ||
    currentPath.startsWith('/api/auth') ||
    currentPath.includes('.') // Skip files with extensions
  ) {
    return NextResponse.next();
  }

  // Redirect /auth/login to /auth/login/user
  if (currentPath === '/auth/login') {
    return NextResponse.redirect(new URL('/auth/login/user', request.url));
  }

  // Get auth cookies
  const token = request.cookies.get('token');
  const role = request.cookies.get('role');

  console.log('Middleware - Auth check:', {
    path: currentPath,
    hasToken: !!token?.value,
    role: role?.value
  });

  // If no token, redirect to login
  if (!token?.value) {
    // For admin paths, redirect to admin login
    if (adminPaths.some(path => currentPath.startsWith(path))) {
      return NextResponse.redirect(new URL('/auth/admin/login', request.url));
    }
    // For other protected paths, redirect to user login
    return NextResponse.redirect(new URL('/auth/login/user', request.url));
  }

  // Check role-based access
  if (adminPaths.some(path => currentPath.startsWith(path)) && role?.value !== 'admin') {
    console.log('Middleware - Unauthorized admin access attempt:', {
      path: currentPath,
      userRole: role?.value
    });
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.svg).*)',
  ],
};
